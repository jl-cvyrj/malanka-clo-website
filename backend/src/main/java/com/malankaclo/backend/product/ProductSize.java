package com.malankaclo.backend.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "product_sizes",
        uniqueConstraints = @UniqueConstraint(name = "uq_product_size", columnNames = {"product_id", "size_code"})
)
public class ProductSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "size_code", nullable = false, length = 20)
    private String sizeCode;

    @Column(nullable = false)
    private boolean available = true;

    protected ProductSize() {
    }

    public ProductSize(String sizeCode, boolean available) {
        this.sizeCode = sizeCode;
        this.available = available;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getSizeCode() { return sizeCode; }
    public boolean isAvailable() { return available; }

    void setProduct(Product product) { this.product = product; }
    public void setSizeCode(String sizeCode) { this.sizeCode = sizeCode; }
    public void setAvailable(boolean available) { this.available = available; }
}
